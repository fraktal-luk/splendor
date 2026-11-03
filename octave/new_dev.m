
graphInfo.fwMatrix = followerMat;
graphInfo.revMatrix = reverseMat;

graphInfo.fwW = getWeights_0(followerMat, valueVector);
graphInfo.revW = getWeights_0(reverseMat, valueVector);

graphInfo.eFrom = edgesFrom;
graphInfo.eTo = edgesTo;



histAll = makeHist2D(mainTable);

%[statsTb, statsHist, status] = exploreWave(graphInfo, mainTable, [1],  16);


testRecord = cell(1, 20);
visitRecord = cell(1, 20);
statsHistories = cell(1, 20);

%testRecord{:} = [];

brev = reviewBuys(mainTable, followerMat, buys, stateInfos);


% for testIter = 10:15
%        % break
% 
%     [st_T, ~, status_T] = exploreWave(graphInfo, mainTable, [1],  testIter);
%     testRecord{testIter} = st_T;
%     visitRecord{testIter} = status_T.visited;
% end

step47 = find(mainTable.step == 47);
step48 = find(mainTable.step == 48);
step49 = find(mainTable.step == 49);
step50 = find(mainTable.step == 50);
