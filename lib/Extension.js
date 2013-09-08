'use strict';

/**
 * Dynamically create an Extension object to be associated with
 * the Decorated Mongoose object.
 *
 * @options
 * @tableName You MUST set a tableName name property so that
 * the extension is unique on the object. If the name is not unique then an Error Will be thrown.
 */
exports = module.exports = function Extension(schema, options) {
    var extension;
    var log = require('nodelogger')('MongooseExtension');
    var _ = require('lodash');

    if (!options.tableName) {
        throw new Error('You must specify a tableName in the options when creating a MongooseExtension');
    }

    options = _.defaults(options || {}, {});

    var TYPE = options.tableName.toLowerCase();
    var upperTableName = options.tableName.slice(0,1).toUpperCase() + options.tableName.slice(1);
    var lowerTableName = options.tableName.slice(0,1).toLowerCase() + options.tableName.slice(1);

    var CREATE_METHOD = 'create' + upperTableName;
    var FIND_METHOD = 'find' + upperTableName;
    var REMOVE_METHOD = 'remove' + upperTableName;
    var FIND_BY_METHOD = 'findBy' + upperTableName;

    if(typeof schema.methods[CREATE_METHOD] === 'function'){
        throw new Error('The tablename you specified is not unique to this schema', schema);
    }

    /**
     * create an extension to associate with your model instance can be accessed by
     * yourModelInstance.create'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[CREATE_METHOD] = function (options,next) {
        getExtension(this.db).createExtension(this, options, next);
    };

    /**
     * create an extension to associate with your model instance can be accessed by
     * YourModel.create'extensionName'(modelInstance, options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.statics[CREATE_METHOD] = function (model, options, next) {
        getExtension(this.db).createExtension(model, options, next);
    };


    /**
     * Removes an extension associated with your model instance can be accessed by
     * yourModelInstance.remove'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[REMOVE_METHOD] = function (options, next) {
        getExtension(this.db).removeExtension(this, options, next);
    };

    /**
     * Removes an extension associated with your model can be accessed by
     * YourModel.remove'extensionName'(model, options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.statics[REMOVE_METHOD] = function (model, options,  next) {
        getExtension(this.db).removeExtension(model, options, next);
    };

    /**
     * Get extensions associated with your model instance can be accessed by
     * YourModelInstance.get'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, extension )
     */
    schema.methods[FIND_METHOD] = function (options, next) {
        options.modelId = this._id;
        getExtension(this.db).find(options, function(err, result){
            log.debug('Finding ', options, result);
            if(err){
                log.error(err);
            }
            next(err, result);
        });
    };

    /**
     * Get an extension associated with your model instance can be accessed by
     * YourModel.get'extensionName'(modelInstance, options, next) (without quotes, case sensitive)
     * @param next (err, extension)
     */
    schema.statics[FIND_METHOD] = function (model, options, next) {
        options.modelId = model._id;
        getExtension(this.db).find(options, next);
    };

    /**
     * Find a YourModelInstance by the extension.
     * YourModel.findBy'extensionName'(options, next) (without quotes, case sensitive)
     * @param next (err, YourModelInstance )
     */
    schema.statics[FIND_BY_METHOD] = function (options, next) {
        var self = this;
        getExtension(this.db).findOne(options, function(err, result){
            result.findModel(self, next);
        });
    };

    /**
     * Returns the extension instance so that you can perform usual
     * mongoose methods on it.
     * @param next
     */
    schema.methods[lowerTableName] = function(next){
        next(null, getExtension(this.db));
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    /**
     * Here is the magic. We pass the db instance from the associated methods
     * and if there is no extension type created we create a temporary mongoose
     * schema in order to build a valid Mongoose object without ever having
     * to import mongoose. This is required as if we import mongoose and the
     * user of the library imports mongoose they are not the same instance
     * and as such Mongoose.Schema === Mongoose.Schema is false which breaks
     * mongoose.
     * @private
     * @param db
     * @returns {*}
     */
    function getExtension(db) {
        if (!extension) {
            //Create temporary model so we can get a hold of a valid Schema object.
            var extensionSchema = db.model('____' + TYPE + '____', {}).schema;
            extensionSchema.statics.TYPE = TYPE;

            var extensionOptions = {
                type: {type: String, 'default': TYPE},
                modelId: String
            };



            extensionSchema.add(extensionOptions);
            //If a schema was passed in then add it to our extension.
            if(options.schema){
                extensionSchema.add(options.schema);
            }

            extensionSchema.methods.findModel = function(Model, next){
                Model.findOne({_id:this.modelId}, next);
            };

            extensionSchema.statics.createExtension = function(model, options, next){
                options.modelId = model._id;
                this.create(options, function(err, result){
                    log.debug('Creating Extension');
                    if(err){
                        log.error(err);
                    }
                    log.debug(result);
                    next(err, result);
                });
            };

            extensionSchema.statics.removeExtension = function(model, options, next){
                options.modelId = model._id;
                this.remove(options, function(err, result){
                    log.debug('Removing Application');
                    if(err){
                        log.error(err);
                    }
                    log.debug(result);
                    next(err, result);
                });

            };

            extension = db.model(TYPE, extensionSchema);
        }
        return extension;
    }
};