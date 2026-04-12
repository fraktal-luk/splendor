
% What we need to develop:
% * viewing small subgraphs:
%   given a state, find its followers and display the resulting subgraph
%   with values


resolved18 = ~isnan(gv18);
fm18 = followerMat;
fm18(:, resolved18) = nan; % cut of edges that are not needed
reducedStates18 = subgraphFrom(1, fm18);



resolved20 = ~isnan(gv20);
fm20 = followerMat;
fm20(:, resolved20) = nan; % cut of edges that are not needed
reducedStates20 = subgraphFrom(1, fm20);


resolved22 = ~isnan(gv22);
fm22 = followerMat;
fm22(:, resolved22) = nan; % cut of edges that are not needed
reducedStates22 = subgraphFrom(1, fm22);


plot(stepValues, 'b')
hold on
plot(stepValues(reducedStates20), 'r')
