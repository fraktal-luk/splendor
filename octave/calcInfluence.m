function [earliestSteps, earliestStates] = calcInfluence(dominants, stepValues)

nStates = numel(dominants);

earliestSteps = nan(1, nStates);
earliestStates = nan(1, nStates);
for s = 1:nStates
    src = dominants(s);
    if isnan(src)
        continue
    end
    earliestSteps(src) = min(earliestSteps(src), stepValues(s));
    earliestStates(src) = min(earliestStates(src), s);
end
