const template = (text, title, group, value) => `
<div class="mdg-action">
	<div class="mdw-action">
		<div><a href="#" data-group="${group}" data-title="${title}"  data-value="${value}">${text}</a></div>
	</div>
</div>
`;

export default template

