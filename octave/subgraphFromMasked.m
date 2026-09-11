function states = subgraphFromMasked(initialStates, followerMat, mask, maxStep)

nStates = width(followerMat);

% rank each state by number of steps
steps = inf(1, nStates);
steps(initialStates) = 1;

stepsOut = countStepsGeneralMasked(followerMat, steps, mask, maxStep);
states = find(stepsOut < inf);
