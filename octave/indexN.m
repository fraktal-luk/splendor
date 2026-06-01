function res = indexN(ind, values)

res = nan(size(ind));
notNan = ~isnan(ind);
res(notNan) = values(ind(notNan));

end
