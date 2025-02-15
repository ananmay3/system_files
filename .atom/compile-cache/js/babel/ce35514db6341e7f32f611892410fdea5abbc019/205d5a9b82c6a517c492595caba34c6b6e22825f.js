Object.defineProperty(exports, "__esModule", {
	value: true
});
/** @babel */

exports["default"] = function (toolBar, button) {
	var options = {
		icon: button.icon,
		iconset: button.iconset,
		text: button.text,
		html: button.html,
		tooltip: button.tooltip,
		priority: button.priority || 45,
		data: button.file,
		callback: function callback(file) {
			atom.workspace.open(file);
		}
	};

	return toolBar.addButton(options);
};

module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2FuYW5tYXkzLy5hdG9tL3BhY2thZ2VzL2ZsZXgtdG9vbC1iYXIvbGliL3R5cGVzL2ZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7cUJBRWUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQ3pDLEtBQU0sT0FBTyxHQUFHO0FBQ2YsTUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLFNBQU8sRUFBRSxNQUFNLENBQUMsT0FBTztBQUN2QixNQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7QUFDakIsTUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLFNBQU8sRUFBRSxNQUFNLENBQUMsT0FBTztBQUN2QixVQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFO0FBQy9CLE1BQUksRUFBRSxNQUFNLENBQUMsSUFBSTtBQUNqQixVQUFRLEVBQUUsa0JBQUMsSUFBSSxFQUFLO0FBQ25CLE9BQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzFCO0VBQ0QsQ0FBQzs7QUFFRixRQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbEMiLCJmaWxlIjoiL2hvbWUvYW5hbm1heTMvLmF0b20vcGFja2FnZXMvZmxleC10b29sLWJhci9saWIvdHlwZXMvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHRvb2xCYXIsIGJ1dHRvbikge1xuXHRjb25zdCBvcHRpb25zID0ge1xuXHRcdGljb246IGJ1dHRvbi5pY29uLFxuXHRcdGljb25zZXQ6IGJ1dHRvbi5pY29uc2V0LFxuXHRcdHRleHQ6IGJ1dHRvbi50ZXh0LFxuXHRcdGh0bWw6IGJ1dHRvbi5odG1sLFxuXHRcdHRvb2x0aXA6IGJ1dHRvbi50b29sdGlwLFxuXHRcdHByaW9yaXR5OiBidXR0b24ucHJpb3JpdHkgfHwgNDUsXG5cdFx0ZGF0YTogYnV0dG9uLmZpbGUsXG5cdFx0Y2FsbGJhY2s6IChmaWxlKSA9PiB7XG5cdFx0XHRhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUpO1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gdG9vbEJhci5hZGRCdXR0b24ob3B0aW9ucyk7XG59XG4iXX0=