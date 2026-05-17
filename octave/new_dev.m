
%% A few example runs
if true
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

%%
    % find crown - which final states are necessary for solution
    crownFM = followerMat;
    fmValues = indexN(followerMat, valueVector);
    crownFM(fmValues < 0 | isnan(fmValues)) = nan;
    crownGraph = subgraphFrom(1, crownFM);
    
    % crown - subset of finals which are needed to derive total solution
    % crown graph - continuous graph from 1 to crown

    nnz(finals(crownGraph))

    % verificaion of crownness: if all values outside crown are chnged to
    % nan, final solution doesn't change
    % - using diffuseValuesQuick?
    % - is it equivalent to using all finals but with prued followers?
    
    areCrownGraph = false(1, nStates);
    areCrownGraph(crownGraph) = true;
    crownFinals = areCrownGraph & finals;
    recValues = nan(1, nStates);
    recValues(crownFinals) = diffVector(crownFinals);

    crownRecValues = diffuseValuesQuick(recValues, crownFM, moves, crownFinals);


    % Assign 'relevancy' values:
    % frontier made of finals in CG are 0
    % backtrack with decreasing number: x = min(x(followers))-1
    % count steps from CG for nodes outside

    % Find reverse graph to facilitate backtracking
    [ets, eto] = sort(edgesTo);
    numbers = diff(find(diff(ets)));
    
    assert(max(numbers) <= 8)

    reverseMat = nan(8, nStates);
    
    efs = edgesFrom(eto);

    eind = 1;

    while eind <= numel(ets)
        inow = eind;
        while eind <= numel(ets) && (ets(eind) == ets(inow))
            eind = eind + 1;
        end

        reverseMat(1:(eind-inow), ets(inow)) = efs(inow:eind-1);
    end

    infCrown = nan(1, nStates);
    infCrown(~areCrownGraph) = -1;
    infCrown(crownFinals) = 0;
    infNonCrown = nan(1, nStates);
    infNonCrown(areCrownGraph) = 0;

    stepsOutside = countStepsGeneral(followerMat, infNonCrown);
    stepsInside = countStepsGeneral(reverseMat, infCrown, true);

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
