function plotOverview(gt, plotValues, finals)

% Lets limit steps for now because of perf
stepLimit = 24;

boundaries = cell(stepLimit, 1);
ranges = cell(stepLimit, 1);

figure
hold on

assert (isequal(size(plotValues), size(finals)) )

for s = 1:stepLimit
    stepStates = gt{s};
    pv = plotValues(stepStates);

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

plot3((1:stepLimit)', zeros(stepLimit, 1), rlines(:,1), 'r')
plot3((1:stepLimit)', zeros(stepLimit, 1), rlines(:,2), 'r')

plot3((1:stepLimit), zeros(1, stepLimit), zeros(1, stepLimit), 'r')
plot3((1:stepLimit), zeros(1, stepLimit), ones(1, stepLimit), 'r')


plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,1), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,2), 'k')
plot3((1:stepLimit)', zeros(stepLimit, 1), blines(:,3), 'k')


view(0, 0)

zlim([-0.3 1.3])
