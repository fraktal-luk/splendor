function reverseMat = getReverseGraph(edgesFrom, edgesTo, nStates)

% Find reverse graph to facilitate backtracking
[ets, eto] = sort(edgesTo);

revBranching = diff(find(diff(ets)));
assert(max(revBranching) <= 10)

efs = edgesFrom(eto);

reverseMat = nan(8, nStates);

eind = 1;

while eind <= numel(ets)
    inow = eind;
    while eind <= numel(ets) && (ets(eind) == ets(inow))
        eind = eind + 1;
    end

    reverseMat(1:(eind-inow), ets(inow)) = efs(inow:eind-1);
end
