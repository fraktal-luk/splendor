
firstU = find(isnan(valueVector), 1);
initialU = Inf(1, numel(valueVector));
initialU(firstU) = 0;
stepsFirstU = countStepsGeneral(dataMat, initialU);

reachedU = stepsFirstU < Inf;


% Is there U with non-U followers?

whichU = isnan(valueVector);

initialU = Inf(size(whichU));
initialU(whichU) = 0;

initialNotU = Inf(size(whichU));
initialNotU(~whichU) = 0;

steps1ofU = countStepsGeneral(dataMat, initialU);
followersOfU = steps1ofU == 1;

steps1ofNotU = countStepsGeneral(dataMat, initialNotU);
followersOfNotU = steps1ofNotU == 1;

% 0 means that no non-U is a follower of U
nnz(~isnan(valueVector(followersOfU)))

