% Partitions states according to steps and relabels all
function [table, labels] = groupSteps(stepValues, values, ranges)

    nStates = numel(stepValues);
    
    assert (max(stepValues) < 30)
    
    table = cell(1, max(stepValues));
    sortedTable = cell(1, max(stepValues));
    
    for s = 1:max(stepValues)
        table{s} = find(stepValues == s);    
        if nargin < 3
            [~, si] = sort(values(table{s}));
        else
            %[~, si] = sortByRange(ranges(:, table{s}));
            [~, si] = sortByRangeAndValue(ranges(:, table{s}), values(:, table{s}));
        end
        sortedTable{s} = table{s}(si);
    end
    
    reorderedStates = cell2mat(sortedTable);
    labels(reorderedStates) = 1:nStates;
end


function [sorted, order] = sortByRange(ranges)
    prOrig = ranges;
    pr = [prOrig; 1:width(prOrig)]'; % append index vector to get sorted order easily
    
    ps1 = sortrows(pr, 2);
    ps2 = sortrows(ps1, 1);
    
    sorted = ps2(:,1:2);
    order = ps2(:, 3);
   % pv2_comp = prOrig(:, ord)';
end


function [sorted, order] = sortByRangeAndValue(ranges, values)
    prOrig = [ranges; values];
    pr = [prOrig; 1:width(prOrig)]'; % append index vector to get sorted order easily
    
    ps1 = sortrows(pr, 2);
    ps2 = sortrows(ps1, 1);
    ps3 = sortrows(ps2, 3);

    sorted = ps3(:,1:3);
    order = ps3(:, 4);
   % pv2_comp = prOrig(:, ord)';
end