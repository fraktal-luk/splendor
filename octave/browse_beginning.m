
% Lets look at a number of first steps, maybe up to 10
% Plot the whole graph of it!

    % upToStepK = stepValues <= 8;
    % stepsK = stepValues(upToStepK);
    % statesK = find(upToStepK);
    % 
    % edgeStartsK = edgesFrom(upToStepK(edgesFrom))';
    % edgeEndsK = edgesTo(upToStepK(edgesFrom))';
    % 
    %     vx = stepValues(edgeEndsK) - stepValues(edgeStartsK);
    %     vy = edgeEndsK - edgeStartsK;
    %     %vz = plotValues(chTo) - plotValues(chFrom);
    % 
    % 
    % quiver(stepValues(edgeStartsK), edgeStartsK, vx, vy, 0, 'k', 'ShowArrowHead', 'off')
    % hold on
    % scatter(stepsK, statesK, 'bo')

plotSubset(edgesFrom, edgesTo, stepValues, upToStepK, 'ko')
plotSubset(edgesFrom, edgesTo, stepValues, upToStepK & wins0, 'rx')


% going from 5 to 7, how much convergence?
step5 = find(stepValues == 5);
step7 = find(stepValues == 7);
step9 = find(stepValues == 9);
step11 = find(stepValues == 11);

fsets = cell(size(step5));
fsets9 = cell(size(step5));
fsets11 = cell(size(step5));

for i = 1:numel(step5)
    subg = subgraphFrom(step5(i), followerMat);
    belong = ismember(step7, subg);
    fsets{i} = step7(belong);

    belong9 = ismember(step9, subg);
    fsets9{i} = step9(belong9);

    belong11 = ismember(step11, subg);
    fsets11{i} = step11(belong11);
end

firstU = find(unknown, 1);
subgraphU = subgraphFrom(firstU, followerMat);

% What are the stats of this subgraph?
nnz(wins0(subgraphU))
nnz(wins1(subgraphU))

% TODO: - find nodes which are U and have nothing but U in their forward cone
%       - Calculate for each node the number of nodes reachable from it?
%           would be hard becaue backtracking the graph and adding numbers doesn't do it, it
%           would not eliminate duplicates

