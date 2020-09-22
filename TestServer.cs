using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace Spaceshits
{
	/// <summary>
	///
	/// So...
	///
	/// I built this minimal static file server, so that I could start playing with JS' new <c>import</c> statements,
	/// which give CORS errors when used directly with the <c>file://</c> system.
	///
	/// I made the choice to use ASP.NET here, because it works, it's <c>F5</c>-able from within Visual Studio,
	/// and I wanted to try the completion.
	///
	/// If you forked this repo, you will still have to provide the <c>.sln</c> file, <c>.csproj</c> file,
	/// along with the <c>Properties\launchSettings.json</c> file, though this one should be generated automatically.
	///
	/// If you happen to find any of the aforementioned files in the repo,
	/// please open an issue to declare this comment obsolete.
	///
	/// https://www.sitepoint.com/using-es-modules/
	/// https://medium.com/ghostcoder/using-es6-modules-in-the-browser-5dce9ca9e911
	/// https://caniuse.com/#feat=es6-module
	/// https://docs.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-3.0#serve-files-outside-of-web-root
	///
	/// </summary>
	public static class TestServer
	{
		public static void Main()
		{
			WebHost
				.CreateDefaultBuilder()
				.Configure(app =>
				{
					IFileProvider fileProvider = new PhysicalFileProvider(Directory.GetCurrentDirectory());

					static void preventCaching(StaticFileResponseContext http)
					{
						http.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
						http.Context.Response.Headers.Add("Expires", "-1");
					}

					app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });

					app.UseStaticFiles(new StaticFileOptions
					{
						FileProvider = fileProvider,
						OnPrepareResponse = preventCaching
					});
				})
				.Build()
				.Run();
		}
	}
}
