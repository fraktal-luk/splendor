
visualize =  false; true;
if visualize
  % CAREFUL: here we'll plot height according to present point difference, not oracle value
  relativeIndexVec = getRelativeInds(stepValues, valueVector);

  xVals = stepValues;
  yVals = relativeIndexVec(:)./(countsPerState(:)+1);

  [x, y, u, v] = calcVectors(dataMat, xVals, yVals);

  xN = x(~optimals);
  yN = y(~optimals);
  uN = u(~optimals);
  vN = v(~optimals);

  xO = x(optimals);
  yO = y(optimals);
  uO = u(optimals);
  vO = v(optimals);

  semilogx(xVals, yVals, 'k.'); % Setting x to log for more clarity

  hold on

  quiver(xN, yN, uN, vN, 0, 'k.');
  quiver(xO, yO, uO, vO, 0, 'g.');

  plot(xVals(win0 & reached'), yVals(win0 & reached'), 'ro', 'MarkerFaceColor','red');
  plot(xVals(win1 & reached'), yVals(win1 & reached'), 'bo', 'MarkerFaceColor','blue');
  plot(xVals(draw & reached'), yVals(draw & reached'), 'gd', 'MarkerFaceColor','green');

end

