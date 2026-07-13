function output = makeHist2D(mainTable)

pointLimit = 16;
maxStep = max(mainTable.step);

output = zeros(1 + pointLimit, maxStep);

mPoints = max(mainTable.p0, mainTable.p1);
steps = mainTable.step;

for i = 1:height(mainTable)
    output(1 + mPoints(i), steps(i)) = output(1 + mPoints(i), steps(i)) + 1;
end
