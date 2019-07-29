describe('Module 01 - Calculate Average Rating', () => {

  const collect_ratings = ast.returnParent('collect_ratings');
  const event_listener = ast.findCall('addEventListener');

  const for_each = ast.findCall('forEach');
  const elements_foreach = {
    'type': 'CallExpression',
    'callee.type': 'MemberExpression',
    'callee.object.name': 'elements',
    'callee.property.name': 'forEach',
    'arguments.0.type': 'ArrowFunctionExpression',
  };
  const for_each_matched = matchObj(for_each, elements_foreach);

  it('Add a `<script>` element. @script-element', () => {
    const element = $('body').children().is('script[src="js/ratings.js"]');
    assert(element, 'Have you added a `<script>` element to the `index.html` file?');
  });

  it('`collect_ratings()` function. @collect-ratings-function', () => {
    assert(ast.findIdentifierParent('collect_ratings'), 'Do you have a function called `collect_ratings()`?');
  });

  it('`ratings` object. @ratings-object', () => {
    assert(ast.findIdentifierParent('ratings'), 'Do you have a `const` called `ratings`?');
    const ratings = ast.findIdentifierParent('ratings').init;
    assert(ratings.type === 'ObjectExpression', 'Is the `ratings` constant an object?');

    const properties = {};
    ratings.properties.forEach((property) => {
       properties[property.key.value] =  property.value.value;
    });
    assert(_.isEqual(properties, { count: 0, sum: 0, average: 0 }), 'Does the `ratings` object contain three key value pairs: `count: 0, sum: 0, average: 0`?');
  });

  it('`rating` variable. @ratings-variable', () => {
    const rating = ast.findIdentifierParent('rating');
    assert(rating, 'Do you have a `const` called `rating`?');
    assert(rating.init.value === 0, 'Is `rating` set to 0?');
  });

  it('Rating HTML elements. @rating-elements', () => {
    const elements = ast.findIdentifierParent('elements');
    assert(elements, 'Do you have a `const` called `elements`?');
    const elements_match = {
      'type': 'CallExpression',
      'callee.object.name': 'document',
      'callee.property.name': 'querySelectorAll',
      'arguments.0.value': '.rating',
    };
    assert(match(elements.init, elements_match), 'Are you assigning the `elements` constant a call to `document.querySelector()` with the correct parameters?');
  });

  it('`elements` `forEach` loop. @elements-foreach', () => {
    assert(for_each_matched, 'Are you using `forEach` to loop through `elements`? Are you passing an arrow function to `forEach`?');
  });

  it('Set `rating` value. @rating-value', () => {
    // rating = parseInt(element.id.replace('star', ''));
    assert(for_each_matched, 'Does the `forEach` loop exist?');
    const rating_for_each = for_each.findIdentifierParent('rating');

    assert(rating_for_each && 
           rating_for_each.right.callee.name === 'parseInt', 'Are you using `parseInt()` to convert the `element.id` to a number?');

    assert(rating_for_each.right.arguments.length === 1, 'Are you passing `parseInt()` the correct number of parameters?');

    const replace_call = {
      'callee.object.object.name': 'element',
      'callee.object.property.name': 'id',
      'callee.property.name': 'replace',
      'arguments.0.value': 'star',
      'arguments.1.value': ''
    }
    assert(match(rating_for_each.right.arguments[0], replace_call), 'Are you passing `parseInt()` a call to the `replace` function on `element.id`? The `replace` function should replace `star` with nothing.');
  });

  it('Set `ratings.count`. @ratings-count', () => {
    // ratings.count += parseInt(element.value);
    assert(for_each_matched, 'Does the `forEach` loop exist?');
    const ratings_count = for_each.findPropertyAssignment('ratings', 'count');
    assert(ratings_count.length, 'In the `forEach` loop are you setting `ratings.count`?');
    const ratings_count_match = {
      'operator': '+=',
      'left.object.name': 'ratings',
      'left.property.name': 'count',
      'right.callee.name': 'parseInt',
      'right.arguments.0.object.name': 'element',
      'right.arguments.0.property.name': 'value'
    };
    assert(matchObj(ratings_count, ratings_count_match),'Are you adding `element.value` to `ratings.count`?');
  });

  it('Set `ratings.sum`. @ratings-sum', () => {
    // ratings.sum += rating * parseInt(element.value);
    assert(for_each_matched, 'Does the `forEach` loop exist?');
    const ratings_sum = for_each.findPropertyAssignment('ratings', 'sum');
    assert(ratings_sum.length, 'In the `forEach` loop are you setting `ratings.sum`?');
    assert(ratings_sum.get().value.operator === '+=', 'Are you adding to the current value of `ratings.sum`?');

    const ratings_sum_match = {
      'callee.name': 'parseInt',
      'arguments.0.object.name': 'element',
      'arguments.0.property.name': 'value'
    };
    assert(ratings_sum.findIdentifierParent('rating').type === 'BinaryExpression' &&
           ratings_sum.findIdentifierParent('rating').operator === '*' &&
           matchObj(ratings_sum.findCall('parseInt'), ratings_sum_match), 'Are you multiplying `rating` by the numeric value(`parseInt`) of `element.value`?');
    });

  it('Check if `ratings.count` is zero. @ratings-count-zero', () => {
    assert(collect_ratings.length, 'Do you have a function called `collect_ratings()`?');
    const if_statement = collect_ratings.findIf();
    assert((if_statement.test.operator === '!==' || if_statement.test.operator === '!=') &&
      ((if_statement.test.right.value === 0 &&  (if_statement.test.left.object.name === 'ratings' &&  if_statement.test.left.property.name === 'count')) ||
      (if_statement.test.left.value === 0 && (if_statement.test.right.object.name === 'ratings' && if_statement.test.right.property.name === 'count'))),
      'Do you have an `if` statement testing whether `ratings.count` is zero?');
  });

  it('Calculate `ratings.average` in `if`. @calculate-ratings-average', () => {
    assert(collect_ratings.length, 'Do you have a function called `collect_ratings()`?');
    const ratings_average = jscs(collect_ratings.findIf()).findPropertyAssignment('ratings', 'average');
    const ratings_average_expr = ratings_average.findBinary();
    const ratings_average_match = {
      'left.object.name': 'ratings',
      'left.property.name': 'sum',
      'operator': '/',
      'right.object.name': 'ratings',
      'right.property.name': 'count'
    };
    assert(matchObj(ratings_average_expr, ratings_average_match), 'Are you calculating the average in the `if` statement and assigning it to `ratings.average`?');
  });

  it('Return `ratings`. @return-ratings', () => {
    assert(collect_ratings.length, 'Do you have a function called `collect_ratings()`?');
    const return_match = { 'argument.name': 'ratings' };
    assert(matchObj(collect_ratings.findReturn(), return_match), 'Are you returning `ratings`?');
  });

  it('Change event listener. @change-event-listener', () => {
    const event_listener_match = {
      'callee.type': 'MemberExpression',
      'callee.object.name': 'document',
      'callee.property.name': 'addEventListener',
      'arguments.0.value': 'change'
    };
    assert(matchObj(event_listener, event_listener_match), 'Have you created an event listener that listens for the `change` event?');
  });

  it('Call `collect_ratings`. @call-collect-ratings', () => {
    const call_collect_ratings = event_listener.findIdentifierParent('ratings');
    assert(call_collect_ratings, 'Are you calling `collect_ratings()` and assigning the result to `ratings`?');
  });

  it('Set value of `#average` to `ratings.average`. @set-average', () => {
    // document.querySelector('#average').value = ratings.average.toFixed(2);
    const query_selector_match = {
      'left.object.callee.object.name': 'document',
      'left.object.callee.property.name': 'querySelector',
      'left.object.arguments.0.value': '#average',
      'left.property.name': 'value',
      'operator': '=',
      'right.callee.object.object.name': 'ratings',
      'right.callee.object.property.name': 'average',
      'right.callee.property.name': 'toFixed',
      'right.arguments.0.value': 2
    }
    const query_selector = event_listener.find(jscs.AssignmentExpression, dot.object(query_selector_match));
    assert(query_selector.length, 'Are you setting the value of the HTML element with an id of `#average` to `ratings.average` fixed to 2 decimal places?')

  });

});
