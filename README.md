## Synopsis

Based on http://www.dragonsofmugloar.com/ test assessment where 
I wanted to try out things haven't done before: `ES6` with `NodeJS`, `NPM` 
and set of modules like `request-promise`. 

For front-end part `pug` and `LESS` are used. 

## Tests

Frankly speaking, there is not much to test as it doesn't make sense
to test external API calls (HTTP requests, XML2JSON conversion and so on). 
The only business logic is making dragon stats, but this one is tested with
execution: battles won are the test result.