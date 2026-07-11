
% _9 is a shorter version of _0: stopped right after solution (1.5M vs 7M
% states)
prefix = '../saved_9/';

[followerMat, valueVector, stringMat] = readFromFiles(prefix);

nStates = width(followerMat);


[moves, points0, points1] = parsePoints(stringMat);

stepValues = countSteps(followerMat);

[edgesFrom, edgesTo] = getEdges(followerMat);
edgesByStep = getEdgesByStep(followerMat, stepValues);

[finals, tips, unknown, ~] = getCategs(points0, points1, valueVector, moves, followerMat);

plotValues = makeDisplayValues(valueVector);

% Group states by steps to reach; LABELS is calculated as states sortd first by step, then by value 
[gt, LABELS] = groupSteps(stepValues, makeDisplayValues(valueVector));

stats = makeStatsPerStep(gt, valueVector, finals, tips);

diffVector = points0 - points1;


% Find reverse graph to facilitate backtracking
reverseMat = getReverseGraph(edgesFrom, edgesTo, nStates);


% rank each state by number of steps
initRevSteps = inf(1, nStates);
initRevSteps(finals) = 0;

revStepValues = countStepsGeneral(reverseMat, initRevSteps);
%
% [edgesRevFrom, edgesRevTo] = getEdges(reverseMat);
% revEdgesByStep = getEdgesByStep(reverseMat, revStepValues);



branching = sum(~isnan(followerMat));
branchingRev = sum(~isnan(reverseMat));

mainTable = table;

mainTable.id = (1:nStates)';
mainTable.value = valueVector';
mainTable.p0 = points0';
mainTable.p1 = points1';
mainTable.label = LABELS';

mainTable.final = finals';
mainTable.tip = tips';

mainTable.step = stepValues';


% Make labels - order sorted by step, then by value
diffRanges24 = diffuseValuesRange(valueVector, followerMat, moves, finals, [-inf; inf]);
plotRanges24 = min(30, max(-30, diffRanges24));

[~, LABELS_R] = groupSteps(stepValues, makeDisplayValues(valueVector), plotRanges24);



% Skeleton: remove nodes so that the overall result is unchanged
% So, because player 0 is winning:
% - for mover 0, the optimal move is chosen
% - for mover 1, all moves are chosen because if it loses, any following '1' change would
%   make it '1' and 'U' would turn it to 'U'
% Apply this to followerMat, removing unneeded links
[skel, skelMat] = findSkeleton(followerMat, valueVector, moves);
isSkel = ismember(1:nStates, skel);

[skel_Both, skelMat_Both] = findSkeleton_Both(followerMat, valueVector, moves);
isSkel_Both = ismember(1:nStates, skel_Both);


approxSkelPerStep = diff(find(diff(sort(stepValues(isSkel)))));


% dominant(s) is a state whose value spreads to s by backtracing
% valueVector(dominant(s)) == valueVector(s) by definition
[dv, dominants] = diffuseValuesQuick_Src(valueVector, followerMat, moves, finals);

% Calculate per state: how influential is it - the higher influence, the
% earlier step has it as the dominant
[earliestSteps, earliestStates] = calcInfluence(dominants, stepValues);
