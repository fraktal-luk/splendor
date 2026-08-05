
graphInfo.fwMatrix = followerMat;
graphInfo.revMatrix = reverseMat;

graphInfo.fwW = getWeights_0(followerMat, valueVector);
graphInfo.revW = getWeights_0(reverseMat, valueVector);

graphInfo.eFrom = edgesFrom;
graphInfo.eTo = edgesTo;


[statsTb, statsHist, status] = exploreWave_Faster(graphInfo, mainTable, [1],  16);


testRecord = cell(1, 20);

for testIter = 1:20
        break

    [st_T, statsHist_T, status_T] = exploreWave_Faster(graphInfo, mainTable, [1],  testIter);
    testRecord{testIter} = st_T.visited;
end
