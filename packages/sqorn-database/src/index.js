const adapterProperties = ({
  client,
  config: { mapOutputKeys = camelCase }
}) => {
  const mapKey = memoize(mapOutputKeys)
  return {
    transaction: {
      value: function(fn) {
        return fn ? client.transactionCallback(fn) : client.transactionObject()
      }
    }
  }
}
