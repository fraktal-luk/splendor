
graphInfo.fwMatrix = followerMat;
graphInfo.revMatrix = reverseMat;

graphInfo.fwW = getWeights_0(followerMat, valueVector);
graphInfo.revW = getWeights_0(reverseMat, valueVector);

graphInfo.eFrom = edgesFrom;
graphInfo.eTo = edgesTo;



histAll = makeHist2D(mainTable);

%[statsTb, statsHist, status] = exploreWave_Faster(graphInfo, mainTable, [1],  16);


testRecord = cell(1, 20);
visitRecord = cell(1, 20);
statsHistories = cell(1, 20);

%testRecord{:} = [];

for testIter = 14:15
      %  break

    [st_T, ~, status_T] = exploreWave_Faster(graphInfo, mainTable, [1],  testIter);
    testRecord{testIter} = st_T;
    visitRecord{testIter} = status_T.visited;
end




if false
    [st_13, ~, status_13] = exploreWave_Faster(graphInfo, mainTable, [1],  13);
    [st_14, ~, status_14] = exploreWave_Faster(graphInfo, mainTable, [1],  14);
    [st_15, ~, status_15] = exploreWave_Faster(graphInfo, mainTable, [1],  15);
    [st_16, ~, status_16] = exploreWave_Faster(graphInfo, mainTable, [1],  16);
    [st_17, ~, status_17] = exploreWave_Faster(graphInfo, mainTable, [1],  17);
    [st_18, ~, status_18] = exploreWave_Faster(graphInfo, mainTable, [1],  18);


nIters13 = find(isnan(st_13.visited), 1) - 1;
nIters14 = find(isnan(st_14.visited), 1) - 1;
nIters15 = find(isnan(st_15.visited), 1) - 1;
nIters16 = find(isnan(st_16.visited), 1) - 1;
nIters17 = find(isnan(st_17.visited), 1) - 1;
nIters18 = find(isnan(st_18.visited), 1) - 1;

% best step for saved9: 15
% best step for saved11: 13



    v14 = visitRecord{14};
    v15 = visitRecord{15};
    v16 = visitRecord{16};
    
    hist14 = makeHist2D(mainTable, v14);
    hist15 = makeHist2D(mainTable, v15);
    hist16 = makeHist2D(mainTable, v16);


    vLeftMinus = v14 & ~v15;
    vLeftCommon = v14 & v15;
    vLeftPlus = ~v14 & v15;
    
    vRightMinus = v16 & ~v15;
    vRightCommon = v16 & v15;
    vRightPlus = ~v16 & v15;

    histLM = makeHist2D(mainTable, vLeftMinus);
    histLC = makeHist2D(mainTable, vLeftCommon);
    histLP = makeHist2D(mainTable, vLeftPlus);

    histRM = makeHist2D(mainTable, vRightMinus);
    histRC = makeHist2D(mainTable, vRightCommon);
    histRP = makeHist2D(mainTable, vRightPlus);

end
