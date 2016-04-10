function [C, sigma] = dataset3Params(X, y, Xval, yval)
%EX6PARAMS returns your choice of C and sigma for Part 3 of the exercise
%where you select the optimal (C, sigma) learning parameters to use for SVM
%with RBF kernel
%   (C, sigma) = EX6PARAMS(X, y, Xval, yval) returns your choice of C and
%   sigma. You should complete this function to return the optimal C and
%   sigma based on a cross-validation set.
%

% You need to return the following variables correctly.
candidate_c = [0.01,0.03,0.1,0.3,1,3,10,30];
candidate_sigma = [0.01,0.03,0.1,0.3,1,3,10,30];
errors = zeros(length(candidate_c));
C = 1;
sigma = 0.3;

% ====================== YOUR CODE HERE ======================
% Instructions: Fill in this function to return the optimal C and sigma
%               learning parameters found using the cross validation set.
%               You can use svmPredict to predict the labels on the cross
%               validation set. For example,
%                   predictions = svmPredict(model, Xval);
%               will return the predictions on the cross validation set.
%
%  Note: You can compute the prediction error using
%        mean(double(predictions ~= yval))
%
for i = 1:length(candidate_c)
  for p = 1:length(candidate_sigma)
    temp_c = candidate_c(i);
    temp_sigma = candidate_sigma(p);
    model= svmTrain(X, y, temp_c, @(x1, x2) gaussianKernel(x1, x2, temp_sigma));
    predictions = svmPredict(model, Xval);
    errors(i, p) = mean(double(predictions ~= yval));
  endfor
endfor

[v, index] = min(errors);
[v, index2] = min(v);
C = candidate_c(index(index2));
sigma = candidate_sigma(index2);





% =========================================================================

end
