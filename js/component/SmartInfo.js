/**
 * Created by 路佳 on 14-3-22.
 * 这个mediator主要帮助元素加载远程数据并填充到内部
 * 元素的默认内容应写在元素内
 * 加载到数据之后，渲染出来的HTML会替换各占位符
 */
;(function (ns) {
  ns.SmartInfo = Backbone.View.extend({
    $context: null,
    spec: null,
    events: {
      'click .edit': 'edit_clickHandler',
      'click .process-button': 'processButton_clickHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.spec = this.$el.data();
      if ('infoId' in this.spec) {
        this.model.once('change:' + this.spec.infoId, this.idReadyHandler, this);
      } else {
        this.model.urlRoot = this.spec.url;
        this.model.once('sync', this.render, this);
        this.model.fetch();
      }
      this.$el.popover({
        selector: '.process-button',
        delay: {hide: 3000}
      });
    },
    remove: function () {
      this.model.off(null, null, this);
      this.$el.popover('destroy');
      Backbone.View.prototype.remove.call(this);
    },
    render: function (model) {
      this.$el.html(this.template(model.toJSON()));
      this.model.on('change', this.model_changeHandler, this);
      this.$('time').text(function () {
        return moment(this.innerHTML).fromNow();
      });
    },
    idReadyHandler: function (model, id) {
      var Model = Backbone.Model.extend({
        urlRoot: this.spec.url
      });
      this.model = new Model({id: id});
      this.model.once('sync', this.render, this);
      this.model.fetch();
    },
    edit_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , options = target.data()
        , prop = event.currentTarget.hash.substr(1);
      options[options.type || 'short-text'] = true;
      this.$context.trigger('edit-model', this.model, prop, options);
      event.preventDefault();
    },
    model_changeHandler: function (model) {
      for (var prop in model.changed) {
        var target = this.$('[href=#' + prop + ']');
        target.text(model.changed[target.data('display')]);
      }
    },
    processButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , href = target.attr('href')
        , json = JSON.stringify(this.model.toJSON());
      href = href.replace(':json', encodeURIComponent(json));
      $.get(href);
      target.addClass('disabled')
        .find('i').addClass('fa-spin fa-spinner');
      event.preventDefault();
      setTimeout(function () {
        target.popover('hide');
      }, 5000);
    }
  });
}(Nervenet.createNameSpace('dianjoy.component')));