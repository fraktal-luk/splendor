
function bm = getBuyMatrix(followerMat, rows, rowBase)

    bm = nan(size(followerMat));
    
    for state = 1:width(followerMat)
        rowsThis = rows(:, state);

        for j = 1:height(followerMat)
            if (isnan(followerMat(j, state)))
                continue
            end

            rowsNext = rows(:, followerMat(j, state));

            rowChange = (rowsThis ~= rowsNext);

            if ~any(rowChange)
                bm(j, state) = 0;
            else
                oldRowId = rowsThis(rowChange);
                newRowId = rowsNext(rowChange);

                if (numel(oldRowId) ~= 1 || numel(newRowId) ~= 1)
                    error('TTTT')
                end

                oldRow = rowBase(1+oldRowId,:);
                newRow = rowBase(1+newRowId,:);
                %newCard = setdiff()

                cardId = setdiff(oldRow(2:end), newRow(2:end));

                if ~isscalar(cardId) 
                    error 'No scalar'
                end

                bm(j, state) = cardId;
            end
        end

    end


end
