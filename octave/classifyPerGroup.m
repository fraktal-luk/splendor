function arr = classifyPerGroup(classes, groups)

ugroups = unique(groups);

arr = nan(numel(ugroups), 4);

for r = 1:numel(ugroups)
    gClasses = classes(groups == ugroups(r));
    arr(r, 1) = nnz(gClasses == '0');
    arr(r, 2) = nnz(gClasses == '1');
    arr(r, 3) = nnz(gClasses == 'D');
    arr(r, 4) = nnz(gClasses == 'U');
end

end
