

startValues = nan(1, nStates);
startValues(finals) = 0;  %valueVector(finals);

% Reversed graph info needed for this task
revGraphInfo.fwMatrix = reverseMat;
revGraphInfo.revMatrix = followerMat;

revGraphInfo.fwW = getWeights_0(reverseMat, valueVector);
revGraphInfo.revW = getWeights_0(followerMat, valueVector);

revGraphInfo.eFrom = edgesTo; % ! reversed like the rest of this struct
revGraphInfo.eTo = edgesFrom;


func = @(followerVals, weigths, ownVal) min(min(followerVals)+1, ownVal);

%vs = generalDiffuse(graphInfo, startValues, find(finals), func);
vs_New = generalDiffuse_New(revGraphInfo, startValues, find(finals), func);

isequaln(vs_New, vs)

%%

    diffNew = diffuse_New(graphInfo, mainTable, find(finals), valueVector(finals));
    
    
    exploreWave_Faster(graphInfo, mainTable, 1);


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

%% rating - distance from optimal path (0 if on path)
ratingFunc = @(fv, w, own) min(own, min(fv + 1 - w));
rating = generalDiffuse_New(graphInfo, startSteps-1, 1, ratingFunc);

%%

%% A few example runs
if false
    explorationInput.valueVector = valueVector;
    explorationInput.maxPoints = max(points0, points1);
    explorationInput.moves = moves;
    explorationInput.finals = finals;
    explorationInput.tips = tips;
    
    
  %  tic;  stats_a = exploreWave(followerMat, explorationInput, 100000, 'oldest'); time_a = toc;
  %  tic;  stats_b = exploreWave(followerMat, explorationInput, 100000, 'newest');  time_b = toc;
    tic;  stats_c = exploreWave(followerMat, explorationInput, inf, 'highV');  time_c = toc;
    tic;  stats_d = exploreWave_Faster(followerMat, explorationInput, nan, '');  time_d = toc;
    
  %  time_a, time_b, 
        time_c,time_d
    % 
    % figure; plotExploration(stats_a)
    % figure; plotExploration(stats_b)
    figure; plotExploration(stats_c)
    figure; plotExploration(stats_d)
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
