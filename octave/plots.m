




%% Selected subgraph

if false
    chosenState = 143632;
    followersRaw = followerMat(:, chosenState);
    followers = followersRaw(~isnan(followersRaw));
    
    plotStates = [chosenState; followers];
    
        stepsFromChosenInit = inf(1, numel(valueVector));
        stepsFromChosenInit(chosenState) = 0;
        
        stepsFromChosen = countStepsGenetiral(followerMat, stepsFromChosenInit);
        
        % size of subtree starting from that state
        chosenNodes = stepsFromChosen < Inf;
        nnz(chosenNodes)
    
    if (nnz(chosenNodes) > 3000); error('too big graph would be'); end
    
    % If subtree not too huge, we can plot it all and observe its properties
    
    edgeSel = ismember(edgesFrom, find(chosenNodes));
    
    chFrom = edgesFrom(edgeSel);
    chTo = edgesTo(edgeSel);
    vFrom = valuesFrom(edgeSel);
    vTo = valuesTo(edgeSel);
    
    dChosen = diffVector(chosenNodes);
    vChosen = valueVector(chosenNodes);
    
    vx = ones(size(chFrom));%stepValues(chTo) - stepValues(chFrom);
    vy = chTo - chFrom;
    vz = plotValues(chTo) - plotValues(chFrom);
    
    chFinal = chTo(finals(chTo));
    chTip = chTo(tips(chTo));
    
    % Careful, chFrom has repeated states
    scatter3(stepValues(chFrom)', chFrom, plotValues(chFrom), 'bo')
    hold on
    
    scatter3(stepValues(chFinal)', chFinal, plotValues(chFinal), 'kd', 'filled')
    scatter3(stepValues(chTip)', chTip, plotValues(chTip), 'rp', '')
    
    quiver3(stepValues(chFrom)', chFrom, plotValues(chFrom), vx, vy, vz,  0, 'k', 'ShowArrowHead', 'off')
    %quiver(stepValues(chFrom)', plotValues(chFrom), vx, vz, 0, 'ShowArrowHead', 'off')
    
    view(90, -10)
    %dg = graph(string(chFrom), string(chTo));
end

%% States by type?

% input:
%   gt
%   plotValues
%   finals

% Lets limit steps for now because of perf
stepLimit = 24;

boundaries = cell(stepLimit, 1);
ranges = cell(stepLimit, 1);

figure
hold on

finalsOrPrefinals = max(points0, points1) >= 10;% TODO: TH

for s = 1:stepLimit
    stepStates = gt{s};
    pv = plotValues(stepStates);

        assert (isequal(size(plotValues), size(finals)) )

    numFinalM = nnz(pv < makeDisplayValues(nan) & finals(stepStates));
    numFinalZP = nnz(pv >= makeDisplayValues(0) & finals(stepStates));

    num = numel(pv);
    numNonFinal = num - numFinalM - numFinalZP;
    zs = ((1:num)-numFinalM)/(numNonFinal+1);

    pvSorted = sort(pv);
    firstNaN = find(pvSorted >= makeDisplayValues(nan), 1);
    firstZ = find(pvSorted >= makeDisplayValues(0), 1);
    firstP = find(pvSorted >= makeDisplayValues(1), 1);

        if isempty(firstNaN); firstNaN = nan; end
        if isempty(firstZ); firstZ = nan; end
        if isempty(firstP); firstP = nan; end
    if s <= 12
        scatter3(repmat(s, 1, num), pvSorted, zs, 'bo')
         %scatter3(repmat(s, 1, 3), zeros(1,3), ([firstNaN, firstZ, firstP]-0.5)/(num+1), 'ro')
    end

    boundaries{s} = ([firstNaN, firstZ, firstP]-0.5 - numFinalM )/(numNonFinal+1);
    ranges{s} = ([0, num+1]  - numFinalM)/(numNonFinal+1);
end

blines = cell2mat(boundaries);
rlines = cell2mat(ranges);

plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,1), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,2), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,3), 'k')

plot3((1:stepLimit)', zeros(stepLimit, 1), rlines(:,1), 'r')
plot3((1:stepLimit)', zeros(stepLimit, 1), rlines(:,2), 'r')


plot3((1:stepLimit), zeros(1, stepLimit), zeros(1, stepLimit), 'r')
plot3((1:stepLimit), zeros(1, stepLimit), ones(1, stepLimit), 'r')

view(0, 0)
