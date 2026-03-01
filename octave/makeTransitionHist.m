function [tab] = makeTransitionHist(edgesFrom, edgesTo, classes)

tab = array2table(nan(4,4), "VariableNames", {'0', '1', 'D', 'U'}, 'DimensionNames', {'from', 'to'}, 'RowNames', {'0' '1' 'D' 'U'}');

fromVec = tab.from;
toVec = tab.Properties.VariableNames;

for r = 1:numel(fromVec)
    for c = 1:numel(toVec)
        tab{r, c} = nnz(classes(edgesFrom) == fromVec{r} & classes(edgesTo) == toVec{c});
    end
end

end
