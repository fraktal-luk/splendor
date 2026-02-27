% Sort so that NaNs are in the middle
function [sorted, order] = sortScores(values)


[sortedNormal, orderNormal] = sort(values);

firstNonneg = find(sortedNormal >= 0, 1);
firstNan = find(isnan(sortedNormal), 1);

if (isempty(firstNonneg) || isempty(firstNan))
   sorted = sortedNormal;
   order = orderNormal;
   return
end

numNonneg = firstNan - firstNonneg;
numNan = numel(values) + 1 - firstNan;

orderNew = orderNormal([1:firstNonneg-1, firstNan:end, firstNonneg:firstNan-1]);
sortedNew = values(orderNew);

order = orderNew;
sorted = sortedNew;

return;





nonnegative = values >= 0;

iminus = find(~nonnegative);
iplus = find(nonnegative);

[vminus, ominus] = sort(values(~nonnegative));
[vplus, oplus] = sort(values(nonnegative));

im = iminus(ominus);
ip = iplus(oplus);

sorted = [vminus(:); vplus(:)];
order = [im(:); ip(:)];

2;


%sorted = [sort(values(~nonnegative))(:); sort(values(nonnegative))(:)];

