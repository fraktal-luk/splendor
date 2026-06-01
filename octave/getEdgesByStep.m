function output = getEdgesByStep(followerMat, stepValues)

maxStep = max(stepValues);

output = cell(1, maxStep);

for i = 1:maxStep
    [output{i}{1}, output{i}{2}] = getEdges(followerMat(:, stepValues == i));
end
