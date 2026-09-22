const Policy = require('../models/Policy');

const evaluatePolicies = async (agent, action, payload) => {
  // Fetch all enabled policies, sorted by priority (lowest number = highest priority)
  const policies = await Policy.find({ enabled: true }).sort({ priority: 1 });

  let decision = null;
  let matchedPolicy = null;

  for (const policy of policies) {
    // If the policy is scoped to a specific action, and it doesn't match this action or '*', skip it
    if (policy.action && policy.action !== '*' && policy.action !== action) {
      continue;
    }

    let allConditionsMet = true;

    for (const condition of policy.conditions) {
      // Resolve the actual value based on the field path
      // Examples: 'agent.role', 'action', 'payload.amount'
      let actualValue;
      if (condition.field.startsWith('agent.')) {
        const key = condition.field.split('.')[1];
        actualValue = agent[key];
      } else if (condition.field === 'action') {
        actualValue = action;
      } else if (condition.field.startsWith('payload.')) {
        const key = condition.field.split('.')[1];
        actualValue = payload ? payload[key] : undefined;
      }

      // Check condition
      switch (condition.operator) {
        case 'equals':
          if (actualValue !== condition.value) allConditionsMet = false;
          break;
        case 'notEquals':
          if (actualValue === condition.value) allConditionsMet = false;
          break;
        case 'greaterThan':
          if (Number(actualValue) <= Number(condition.value)) allConditionsMet = false;
          break;
        case 'lessThan':
          if (Number(actualValue) >= Number(condition.value)) allConditionsMet = false;
          break;
        case 'contains':
          if (!String(actualValue).includes(String(condition.value))) allConditionsMet = false;
          break;
        default:
          allConditionsMet = false; // unknown operator, fail safe
      }

      if (!allConditionsMet) {
        break; // Stop evaluating conditions for this policy if one fails
      }
    }

    if (allConditionsMet && policy.conditions.length > 0) {
      decision = policy.effect;
      matchedPolicy = policy;
      // High priority matched, we can break or we can keep evaluating if we want to combine,
      // but usually the first matching high priority policy wins.
      break; 
    }
  }

  return { decision, matchedPolicy };
};

module.exports = { evaluatePolicies };
