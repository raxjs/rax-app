import PropTypes from '../PropTypes';

describe('PropTypes', () => {
  it('should check length type', () => {
    expect(PropTypes.length('16rem', null, null)).toBeNull();
    expect(PropTypes.length('red', null, null)).not.toBeNull();
  });

  it('should check number type', () => {
    expect(PropTypes.number('16.2', null, null)).toBeNull();
    expect(PropTypes.number('16.5px', null, null)).not.toBeNull();
  });

  it('should check integer type', () => {
    expect(PropTypes.integer('16', null, null)).toBeNull();
    expect(PropTypes.integer('16px', null, null)).not.toBeNull();
  });

  it('should check enum type', () => {
    const list = ['red', 'blue'];

    expect(PropTypes.oneOf(list)('red', null, null)).toBeNull();
    expect(PropTypes.oneOf(list)('gray', null, null)).not.toBeNull();
  });

  it('should check color type', () => {
    expect(PropTypes.color('red', null, null)).toBeNull();
    expect(PropTypes.color('#666', null, null)).toBeNull();
    expect(PropTypes.color('rgb(255, 0, 0)', null, null)).toBeNull();
    expect(PropTypes.color('16px', null, null)).not.toBeNull();
  });
});
