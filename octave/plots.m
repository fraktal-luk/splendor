


plotValues = makeDisplayValues(valueVector);


%% Selected subgraph

chosenState = 143632;
followersRaw = followerMat(:, chosenState);
followers = followersRaw(~isnan(followersRaw));

plotStates = [chosenState; followers];

    stepsFromChosenInit = inf(1, numel(valueVector));
    stepsFromChosenInit(chosenState) = 0;
    
    stepsFromChosen = countStepsGeneral(followerMat, stepsFromChosenInit);
    
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


%% States by type?

% Lets limit steps for now because of perf
stepLimit = 16 + 4;

boundaries = cell(stepLimit, 1);

figure
hold on


for s = 1:stepLimit
    stepStates = gt{s};
    pv = plotValues(stepStates);
    num = numel(pv);
    zs = (1:num)/(num+1);

    pvSorted = sort(pv);
    firstNaN = find(pvSorted >= makeDisplayValues(nan), 1);
    firstZ = find(pvSorted >= makeDisplayValues(0), 1);
    firstP = find(pvSorted >= makeDisplayValues(1), 1);

        if isempty(firstNaN); firstNaN = nan; end
        if isempty(firstZ); firstZ = nan; end
        if isempty(firstP); firstP = nan; end

    scatter3(repmat(s, 1, num), pvSorted, zs, 'bo')

    scatter3(repmat(s, 1, 3), zeros(1,3), ([firstNaN, firstZ, firstP]-0.5)/(num+1), 'ro')

    boundaries{s} = ([firstNaN, firstZ, firstP]-0.5)/(num+1);
end

blines = cell2mat(boundaries);

plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,1), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,2), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,3), 'k')

view(0, 0)
