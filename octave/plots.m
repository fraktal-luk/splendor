

plotValues = makeDisplayValues(valueVector);

chosenState = 3789;
followersRaw = dataMat(:, chosenState);
followers = followersRaw(~isnan(followersRaw));

plotStates = [chosenState; followers];

scatter(stepValues(plotStates), plotValues(plotStates), 'r')
