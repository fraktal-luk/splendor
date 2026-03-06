
gt = groupSteps(stepValues);
stats = makeStatsPerStep(gt, valueVector, finals, tips);

finals18 = finals & stepValues <= 18;
    finals20 = finals & stepValues <= 20;
    finals22 = finals & stepValues <= 22;
    finals24 = finals & stepValues <= 24;

% See what happens if we don't know finals beyond some step
recValues18 = nan(1, nStates);
recValues18(finals18) = diffVector(finals18);

[gv18, revS18] = diffuseValues(recValues18, followerMat, moves, finals18);

    recValues20 = nan(1, nStates);
    recValues20(finals20) = diffVector(finals20);
    
    [gv20, revS20] = diffuseValues(recValues20, followerMat, moves, finals20);

    
    recValues22 = nan(1, nStates);
    recValues22(finals22) = diffVector(finals22);
    
    [gv22, revS22] = diffuseValues(recValues22, followerMat, moves, finals22);


    recValues24 = nan(1, nStates);
    recValues24(finals24) = diffVector(finals24);
    
    [gv24, revS24] = diffuseValues(recValues24, followerMat, moves, finals24);

stats18 = makeStatsPerStep(gt, gv18, finals18, tips);
stats20 = makeStatsPerStep(gt, gv20, finals20, tips);
stats22 = makeStatsPerStep(gt, gv22, finals22, tips);
stats24 = makeStatsPerStep(gt, gv24, finals24, tips);

