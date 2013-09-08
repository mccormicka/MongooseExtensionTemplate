'use strict';

describe('MongooseExtension Tests', function () {

    var mockgoose = require('Mockgoose');
    var mongoose = require('mongoose');
    mockgoose(mongoose);
    var db = mongoose.createConnection('mongodb://localhost:3001/Whatever');
    var Index = require('../index');
    var schema = new mongoose.Schema();
    schema.plugin(Index.plugin, {tableName: 'randomTableName', schema:{name:String}});
    var Model = db.model('randommodel', schema);

    beforeEach(function (done) {
        mockgoose.reset();
        done();
    });

    describe('SHOULD', function () {

        describe('Create dynamic methods', function () {

            it('Create a static method on the model called createRandomTableName', function (done) {
                expect(typeof Model.createRandomTableName === 'function').toBeTruthy();
                done();
            });

            it('Create a method on the model called createRandomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.createRandomTableName === 'function').toBeTruthy();
                        done();
                    } else {
                        done('Error creating model 1');
                    }
                });
            });

            it('Create a static method on the model called findRandomTableName', function (done) {
                expect(typeof Model.findRandomTableName === 'function').toBeTruthy();
                done();
            });

            it('Create a method on the model called findRandomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.findRandomTableName === 'function').toBeTruthy();
                        done();
                    } else {
                        done('Error creating model');
                    }
                });
            });

            it('Return the extension randomTableName', function (done) {
                Model.create({}, function (err, result) {
                    expect(err).toBeNull();
                    expect(result).toBeTruthy();
                    if (result) {
                        expect(typeof result.randomTableName === 'function').toBeTruthy();
                        result.randomTableName(function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.TYPE).toBe('randomtablename');
                                done(err);
                            } else {
                                done('Error returning extension object');
                            }
                        });
                    } else {
                        done('Error creating model');
                    }
                });
            });

        });

        it('Attach a new extension to the model', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                expect(result.name).toBe('TestExtension');
                                model.findRandomTableName({}, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result.length).toBe(1);
                                        expect(result[0].name).toBe('TestExtension');
                                        done(err);
                                    } else {
                                        done('Can not find associated extension');
                                    }
                                });
                            } else {
                                done('Error creating extension');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Attach multiple extensions to the same model', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'}, function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBeTruthy();
                        model.createRandomTableName({name: 'TestExtension2'}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeTruthy();
                            model.findRandomTableName({}, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    expect(result.length).toBe(2);
                                    expect(result[0].name).toBe('TestExtension');
                                    expect(result[1].name).toBe('TestExtension2');
                                    done(err);
                                } else {
                                    done('Can not find associated extension');
                                }
                            });
                        });
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to find an extension by its name', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'}, function (err, result) {
                        expect(err).toBeNull();
                        expect(result).toBeTruthy();
                        model.createRandomTableName({name: 'TestExtension2'}, function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeTruthy();
                            model.findRandomTableName({name: 'TestExtension2'}, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    console.log('RESULT IS', result);
                                    expect(result.length).toBe(1);
                                    expect(result[0].name).toBe('TestExtension2');
                                    done(err);
                                } else {
                                    done('Can not find associated extension');
                                }
                            });
                        });
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to remove Extensions', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'},
                        function (err, result) {
                            expect(err).toBeNull();
                            expect(result).toBeDefined();
                            if (result) {
                                model.removeRandomTableName({name: 'TestExtension'}, function (err, result) {
                                    expect(err).toBeNull();
                                    expect(result).toBeDefined();
                                    if (result) {
                                        expect(result.name).toBe('TestExtension');
                                        model.findRandomTableName({name: 'TestExtension'}, function (err, result) {
                                            expect(err).toBeNull();
                                            expect(result).toEqual([]);
                                            done(err);
                                        });
                                    } else {
                                        done('Error removing Extension');
                                    }
                                });
                            } else {
                                done('Error creating extension');
                            }
                        });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to get the model from an extension', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'}, function (err, app) {
                        if (app) {
                            app.findModel(Model, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    expect(result._id.toString()).toBe(model._id.toString());
                                    done(err);
                                } else {
                                    done('Error finding associated model');
                                }
                            });
                        } else {
                            done('Error retrieving extension');
                        }
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Be able to find a model by extension', function (done) {
            Model.create({}, function (err, model) {
                expect(err).toBeNull();
                expect(model).toBeTruthy();
                if (model) {
                    model.createRandomTableName({name: 'TestExtension'}, function (err, app) {
                        if (app) {
                            Model.findByRandomTableName({name: 'TestExtension'}, function (err, result) {
                                expect(err).toBeNull();
                                expect(result).toBeDefined();
                                if (result) {
                                    expect(result._id.toString()).toBe(model._id.toString());
                                    done(err);
                                } else {
                                    done('Error finding associated model');
                                }
                            });
                        } else {
                            done('Error retrieving extension');
                        }
                    });
                } else {
                    done('Error creating model');
                }
            });
        });

        it('Extend the extension schema with the schema passed through the options object', function (done) {

            var schema = new mongoose.Schema();
            schema.plugin(Index.plugin,
                {
                    tableName: 'randomTableName2',
                    schema: {
                        name:String,
                        customType: {
                            type: Boolean,
                            'default': true
                        }
                    }
                }
            );
            var Model = db.model('randomTableName2', schema);

            Model.create({}, function(err, model){
                expect(err).toBeNull();
                expect(model).toBeDefined();
                if(model){
                    model.createRandomTableName2({name:'TestExtension'}, function(err, result){
                        expect(result.name).toBe('TestExtension');
                        expect(result.customType).toBe(true);
                        done(err);
                    });
                }else{
                    done('Error creating new model');
                }
            });
        });
    });
});