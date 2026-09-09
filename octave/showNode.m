% Print a state and its followers in an informative way
function showNode(state, mainTable, followerMat, buys, stateInfos)
    toks0 = double( stateInfos.toks0(:, state))';
    toks1 = double( stateInfos.toks1(:, state))';

    % Moves done before are stepValue(state)


    stepValue = mainTable.step(state);
    movedBy0 = ceil(stepValue/2); 
    movedBy1 = floor(stepValue/2); 
    nCards0 = sum(toks0(1:5));
    nCards1 = sum(toks1(1:5));

        nTakes0 = movedBy0 - nCards0;
        nTakes1 = movedBy1 - nCards1;

    mover = stateInfos.moves(state);
    followersAll = followerMat(:, state);
    actual = ~isnan(followersAll);
    followers = followersAll(actual);
    cards = buys(actual, state);

    if mover == 0
        toks = toks0;
        nTakes = nTakes0;
        nCards = nCards0;
    else
        toks = toks1;
        nTakes = nTakes1;
        nCards = nCards1;
    end

    fprintf('S(%d) mv %d\n(%s) %dT/%dB\n', state, mover, num2str(toks), nTakes, nCards)

    for i = 1:numel(followers)
        if cards(i) == 0
            fprintf('  [T] -> %d\n', followers(i))
        else
            price = [getCardPrice(cards(i)), 0];
            effPrice = max(0, price - toks);
            fprintf('  [%d] -> %d   (%s)\n', cards(i), followers(i), num2str(effPrice))
        end
    end
end
