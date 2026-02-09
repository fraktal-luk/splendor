% Sort so that NaNs are in the middle
function [sorted, order] = sortScores(values)

nonnegative = values >= 0;

iminus = find(~nonnegative);
iplus = find(nonnegative);

[vminus, ominus] = sort(values(~nonnegative));
[vplus, oplus] = sort(values(nonnegative));

sorted = [vminus(:); vplus(:)];
order = [iminus(ominus)(:); iplus(oplus)(:)];

%sorted = [sort(values(~nonnegative))(:); sort(values(nonnegative))(:)];

