function table = groupSteps(stepValues)

assert (max(stepValues) < 30)

table = cell(1, max(stepValues));

for s = 1:max(stepValues)
    table{s} = find(stepValues == s);
end
