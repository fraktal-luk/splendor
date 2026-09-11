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

    nToks = toks(end);

    fprintf('S(%d) mv %d\n(%s) %dT/%dB\n', state, mover, num2str(toks), nTakes, nCards)

    MAX_COLOR = 4; % max token per color for 2 players

    for i = 1:numel(followers)
        if cards(i) == 0
            fprintf('  [T] -> %d\n', followers(i))
        else
            price = [getCardPrice(cards(i)), 0];
            effPrice = max(0, price - toks);

            overLimit = max(0, effPrice - MAX_COLOR);
            surpluses = max(0, effPrice - nTakes); % number of times we had to take 2 (limiting total number)
            
            effSum = sum(effPrice + surpluses);

            fault = '';
 
            if sum(effPrice) > nToks
                fault = 'WTF';
            elseif any(overLimit)
                fault = '#';
            elseif effSum > nToks
                fault = '$';
            end

            fprintf('  [%d] -> %d  (%s)   %s\n', cards(i), followers(i), num2str(effPrice), fault)
        end
    end
end
