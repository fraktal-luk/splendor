function reviewBuys(buys, moves, toks0, toks1)
    
    for state = 1:width(buys)
        mover = moves(state);
        
        if mover == 0
            toks = toks0(:, state)';
        else
            toks = toks1(:, state)';
        end
        
        %
        for j = 1:height(buys)
            cardId = buys(j, state);
            if (isnan(cardId) || cardId == 0)
                continue
            end

            priceVec = getCardPrice(cardId);

            effPrice = max(priceVec - toks, 0);

            % Check if effective price has numbers over 4 (token num per color)
            %   Then check if the sequence of takes is possible

            dummy = 1;
        end
    end
end
