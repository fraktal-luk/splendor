
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
step51 = find(mainTable.step == 51);
step52 = find(mainTable.step == 52);
step53 = find(mainTable.step == 53);
step54 = find(mainTable.step == 54);
step55 = find(mainTable.step == 55);

v47 = step47(mainTable.categ(step47) == 'V');
v48 = step48(mainTable.categ(step48) == 'V');
v49 = step49(mainTable.categ(step49) == 'V');
v50 = step50(mainTable.categ(step50) == 'V');
v51 = step51(mainTable.categ(step51) == 'V');
v52 = step52(mainTable.categ(step52) == 'V');
v53 = step53(mainTable.categ(step53) == 'V');
v54 = step54(mainTable.categ(step54) == 'V');
v55 = step55(mainTable.categ(step55) == 'V');

vComb = [v47; v48; v49; v50; v51;   v52; v53; v54; v55]';

followersComb = followerMat(:, vComb);

charMat = char(indexN(followersComb, mainTable.categ));
valMat = (indexN(followersComb, mainTable.value));

buyMat = (buys(:, vComb));


buyMatV = nan(size(buyMat));
buyMatV(isnan(valMat)) = buyMat(isnan(valMat));

[vComb; buyMatV]

forking = sum(~isnan(buyMatV)) > 1;
vFork = vComb(forking);


% followerMat(:, vFork)
% buyMatV(:, forking)


[double(mainTable.step(vComb)), vComb', mainTable.value(vComb)]

[indexN(followerMat(2:8, vComb)', valueVector)]

[vComb', mainTable.p0(vComb), mainTable.p1(vComb)]
