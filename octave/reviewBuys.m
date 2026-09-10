function outputs = reviewBuys(mainTable, followerMat, buys, stateInfos)
    
    outputs = nan(size(buys));

    for state = 1:width(buys)
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
        cards = buys(:, state);
    
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
    
        %fprintf('S(%d) mv %d\n(%s) %dT/%dB\n', state, mover, num2str(toks), nTakes, nCards)
    
        MAX_COLOR = 4; % max token per color for 2 players
    
        for j = 1:numel(followersAll)
            if cards(j) == 0
                outputs(j, state) = 0;
            elseif isnan(cards(j))
                %fprintf('  [T] -> %d\n', followers(i))
            else
                price = [getCardPrice(cards(j)), 0];
                effPrice = max(0, price - toks);
    
                overLimit = max(0, effPrice - MAX_COLOR);
                surpluses = max(0, effPrice - nTakes); % number of times we had to take 2 (limiting total number)
                
                effSum = sum(effPrice + surpluses);
    
                %fault = '';
     
                if sum(effPrice) > nToks
                    %fault = 'WTF';
                    error('WTF')
                elseif any(overLimit)
                    %fault = '#';
                    outputs(j, state) = 2;
                elseif effSum > nToks
                    %fault = '$';
                    outputs(j, state) = 1;
                else
                    outputs(j, state) = 0;
                end
    
                %fprintf('  [%d] -> %d  (%s)   %s\n', cards(i), followers(i), num2str(effPrice), fault)
            end
        end
    end
end
