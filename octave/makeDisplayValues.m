function res = makeDisplayValues(values)

res = values + 0.5;
res(values < 0) = values(values < 0) - 0.5;
res(isnan(values)) = -0.5;

