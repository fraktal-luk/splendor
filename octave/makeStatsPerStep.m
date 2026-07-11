function stats = makeStatsPerStep(stepGroups, values, finals, tips)

cols = {'0', 'D', 'U', '1', 'F', 'T'};
stats = array2table(nan(length(stepGroups), length(cols)), 'VariableNames', cols);

for s = 1:numel(stepGroups)
    vals = values(stepGroups{s});
    n0 = nnz(vals > 0);
    nD = nnz(vals == 0);
    nU = nnz(isnan(vals));
    n1 = nnz(vals < 0);

    nF = nnz(finals(stepGroups{s}));
    nT = nnz(tips(stepGroups{s}));

    stats{s, :} = [n0, nD, nU, n1, nF, nT];
end
