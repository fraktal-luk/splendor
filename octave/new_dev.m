

startValues = nan(1, nStates);
startValues(finals) = 0;  %valueVector(finals);

% Reversed graph info needed for this task
graphInfo.fwMatrix = reverseMat;
graphInfo.revMatrix = followerMat;

graphInfo.fwW = getWeights_0(reverseMat, valueVector);
graphInfo.revW = getWeights_0(followerMat, valueVector);

graphInfo.eFrom = edgesTo; % ! reversed like the rest of this struct
graphInfo.eTo = edgesFrom;




func = @(followerVals, weigths, ownVal) min(min(followerVals)+1, ownVal);

vs = generalDiffuse(graphInfo, startValues, find(finals), func);
vs_New = generalDiffuse_New(graphInfo, startValues, find(finals), func);

isequaln(vs_New, vs)

%%
clear graphInfo

% Normal graph info this time 
graphInfo.fwMatrix = followerMat;
graphInfo.revMatrix = reverseMat;

graphInfo.fwW = getWeights_0(followerMat, valueVector);
graphInfo.revW = getWeights_0(reverseMat, valueVector);

graphInfo.eFrom = edgesFrom;
graphInfo.eTo = edgesTo;



startSteps = inf(1, nStates);
startSteps(1) = 1;

steps_T = generalDiffuse(graphInfo, startSteps, 1, func);
steps_TNew = generalDiffuse_New(graphInfo, startSteps, 1, func);

isequaln(steps_T, stepValues)
isequaln(steps_TNew, stepValues)

%%

if false
    resolved18 = ~isnan(gv18);
    fm18 = followerMat;
    fm18(:, resolved18) = nan; % cut of edges that are not needed
    reducedStates18 = subgraphFrom(1, fm18);
    
    
    
    resolved20 = ~isnan(gv20);
    fm20 = followerMat;
    fm20(:, resolved20) = nan; % cut of edges that are not needed
    reducedStates20 = subgraphFrom(1, fm20);
    
    
        resolved20c = ~isnan(gv20) & stepsOpt' < 10;
        fm20c = followerMat;
        fm20c(:, resolved20c) = nan; % cut of edges that are not needed
        reducedStates20c = subgraphFrom(1, fm20c);
    
    
    
    resolved22 = ~isnan(gv22);
    fm22 = followerMat;
    fm22(:, resolved22) = nan; % cut of edges that are not needed
    reducedStates22 = subgraphFrom(1, fm22);
    
    
    plot(stepValues, 'b')
    hold on
    plot(stepValues(reducedStates20), 'r')
    
    
    minP = min(points0, points1);
    maxP = max(points0, points1);
    
    
    h24 = histcounts(diffVector, -30.5:30.5);
    h24r20 = histcounts(diffVector(reducedStates20), -30.5:30.5);
    
    p0h24 = histcounts(points0, -30.5:30.5);
    p0h24r20 = histcounts(points0(reducedStates20), -30.5:30.5);
    
    p1h24 = histcounts(points1, -30.5:30.5);
    p1h24r20 = histcounts(points1(reducedStates20), -30.5:30.5);
    
    
    max_h24 = histcounts(maxP, -30.5:30.5);
    max_h24r20 = histcounts(maxP(reducedStates20), -30.5:30.5);
    
    min_h24 = histcounts(minP, -30.5:30.5);
    min_h24r20 = histcounts(minP(reducedStates20), -30.5:30.5);

end

pRange = -30:30;

if false
    bar(pRange, h24, 'k')
    hold on
    bar(pRange, h24r20, 'r')
    
    figure
    bar(pRange, p0h24, 'k')
    hold on
    bar(pRange, p0h24r20, 'r')
    
    
    figure
    bar(pRange, p1h24, 'k')
    hold on
    bar(pRange, p1h24r20, 'r')
    
    figure
    bar(pRange, min_h24, 'k')
    hold on
    bar(pRange, min_h24r20, 'r')
    
    figure
    bar(pRange, max_h24, 'k')
    hold on
    bar(pRange, max_h24r20, 'r')
end

%% A few example runs
if false
    explorationInput.valueVector = valueVector;
    explorationInput.moves = moves;
    explorationInput.finals = finals;
    explorationInput.tips = tips;
    
    
    tic;  stats_a = exploreWave(followerMat, explorationInput, 100000, 'oldest'); time_a = toc;
    tic;  stats_b = exploreWave(followerMat, explorationInput, 100000, 'newest');  time_b = toc;
    tic;  stats_c = exploreWave(followerMat, explorationInput, 100000, 'highV');  time_c = toc;
    
    time_a, time_b, time_c
    
    figure; plotExploration(stats_a)
    figure; plotExploration(stats_b)
    figure; plotExploration(stats_c)
end

if false
    optimals = markOptimalMoves(valueVector, followerMat);
 
    reached = findReachable(followerMat, optimals, moves);

    initialStepsOpt = inf(1, numel(reached));
    initialStepsOpt(reached) = 0;

    % How many steps away from optimal path
    stepsOpt = countStepsGeneral(followerMat, initialStepsOpt);
    in4steps = stepsOpt <= 4;
end
