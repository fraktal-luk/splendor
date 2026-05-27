function [edgesFrom, edgesTo] = getEdges(followerMat)

nStates = width(followerMat);
[statesRep, ~] = meshgrid(1:nStates, 1:13);
edgesFrom = statesRep(~isnan(followerMat));
edgesTo = followerMat(~isnan(followerMat));
