% Partitions states according to steps and relabels all
function [table, labels] = groupSteps(stepValues, values)

nStates = numel(stepValues);

assert (max(stepValues) < 30)

table = cell(1, max(stepValues));
sortedTable = cell(1, max(stepValues));

for s = 1:max(stepValues)
    table{s} = find(stepValues == s);
    [~, si] = sort(values(table{s}));
    sortedTable{s} = table{s}(si);
end

reorderedStates = cell2mat(sortedTable);
labels(reorderedStates) = 1:nStates;
