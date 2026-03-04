
plotValues = makeDisplayValues(valueVector);


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

