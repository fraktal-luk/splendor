

    % find crown - which final states are necessary for solution
    crownFM = followerMat;
    fmValues = indexN(followerMat, valueVector);
    crownFM(fmValues < 0 | isnan(fmValues)) = nan;
    crownGraph = subgraphFrom(1, crownFM);
    
    % crown - subset of finals which are needed to derive total solution
    % crown graph - continuous graph from 1 to crown

    % verificaion of crownness: if all values outside crown are chnged to
    % nan, final solution doesn't change
    % - using diffuseValuesQuick?
    % - is it equivalent to using all finals but with prued followers?

    areCrownGraph = ismember(1:nStates, crownGraph);
    crownFinals = areCrownGraph & finals;

    recValues = nan(1, nStates);
    recValues(crownFinals) = diffVector(crownFinals);
    crownRecValues = diffuseValuesQuick(recValues, crownFM, moves, crownFinals);


    % Assign 'relevancy' values:
    % frontier made of finals in CG are 0
    % backtrack with decreasing number: x = min(x(followers))-1
    % count steps from CG for nodes outside


    initCrown = nan(1, nStates);
    initCrown(~areCrownGraph) = -1;
    initCrown(crownFinals) = 0;
    initOutside = nan(1, nStates);
    initOutside(areCrownGraph) = 0;

    stepsOutside = countStepsGeneral(followerMat, initOutside);
    stepsInside = countStepsGeneral(reverseMat, initCrown, true);

    stepsMerged = -stepsOutside;
    stepsMerged(areCrownGraph) = stepsInside(areCrownGraph);


commonUnnormalized = [
            points0', points1', max(points0, points1)', min(points0, points1)', stepValues',...
            double(areCrownGraph'), stepsOutside', stepsInside', stepsMerged'
           ];
commonNormalized = normalize(commonUnnormalized);
corrMat = commonNormalized' * commonNormalized / nStates;

nStates15 = nnz(stepValues < 15);
commonU15 = commonUnnormalized(stepValues < 15, :);
commonN15 = normalize(commonU15);
corrMat15 = commonN15' * commonN15 / nStates15;

