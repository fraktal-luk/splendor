function states = subgraphFrom(initialStates, followerMat)

nStates = width(followerMat);

% rank each state by number of steps
steps = inf(1, nStates);
steps(initialStates) = 1;

stepsOut = countStepsGeneral(followerMat, steps);
states = find(stepsOut < inf);
